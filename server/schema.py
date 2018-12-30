from models import Post, User
import graphene
from graphql import GraphQLError
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from db import db


def require_auth(method):
    def wrapper(self, *args, **kwargs):
        auth_resp = User.decode_auth_token(args[0].context)
        if not isinstance(auth_resp, str):
            kwargs['user'] = User.query.filter_by(uuid=auth_resp).first()
            return method(self, *args, **kwargs)
        raise GraphQLError(auth_resp)
    return wrapper


class PostObject(SQLAlchemyObjectType):
    class Meta:
        model = Post
        interfaces = (graphene.relay.Node, )


class UserObject(SQLAlchemyObjectType):
   class Meta:
       model = User
       interfaces = (graphene.relay.Node, )
       exclude_fields = ('password_hash')


class Viewer(graphene.ObjectType):
    class Meta:
        interfaces = (graphene.relay.Node, )

    all_posts = SQLAlchemyConnectionField(PostObject)
    all_users = SQLAlchemyConnectionField(UserObject)


class Query(graphene.ObjectType):
    node = graphene.relay.Node.Field()
    viewer = graphene.Field(Viewer)

    @staticmethod
    def resolve_viewer(root, info):
        auth_resp = User.decode_auth_token(info.context)
        if not isinstance(auth_resp, str):
            return Viewer()
        raise GraphQLError(auth_resp)


class SignUp(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(lambda: UserObject)
    auth_token = graphene.String()
    def mutate(self, info, **kwargs):
        user = User(username=kwargs.get('username'))
        user.set_password(kwargs.get('password'))
        db.session.add(user)
        db.session.commit()
        return SignUp(user=user, auth_token=user.encode_auth_token(user.uuid).decode())


class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(lambda: UserObject)
    auth_token = graphene.String()

    def mutate(self, info, **kwargs):
        user = User.query.filter_by(username=kwargs.get('username')).first()
        if user is None or not user.check_password(kwargs.get('password')):
            raise GraphQLError("Invalid Credentials")
        return Login(user=user, auth_token=user.encode_auth_token(user.uuid).decode())


class CreatePost(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        body = graphene.String(required=True) 
        author_uuid = graphene.Int(required=True)
    post = graphene.Field(lambda: PostObject)
    
    @require_auth
    def mutate(self, info, **kwargs):
        user = User.query.filter_by(uuid=kwargs.get('author_uuid')).first()
        post = Post(title=kwargs.get('title'), body=kwargs.get('body'))
        if user is not None:
            post.author = user
        db.session.add(post)
        db.session.commit()
        return CreatePost(post=post)


class UpdatePost(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        body = graphene.String(required=True) 
        uuid = graphene.Int(required=True)
    post = graphene.Field(lambda: PostObject)
    
    @require_auth
    def mutate(self, info, **kwargs):
        post = Post.query.filter_by(uuid=kwargs.get('uuid')).first()
        author = User.query.filter_by(uuid=post.author.uuid).first()
        if kwargs.get('user') != author:
            raise GraphQLError("You do not have permissions to update this post.")
        else:
            post.title = kwargs.get('title')
            post.body = kwargs.get('body')
            db.session.commit()
            return UpdatePost(post=post)


class DeletePost(graphene.Mutation):
    class Arguments:
        uuid = graphene.Int(required=True)

    status = graphene.String()
    
    @require_auth
    def mutate(self, info, **kwargs):
        post = Post.query.filter_by(uuid=kwargs.get('uuid')).first()
        author = User.query.filter_by(uuid=post.author.uuid).first()
        if kwargs.get('user') != author:
            raise GraphQLError("You do not have permissions to delete this post.")
        else:
            db.session.delete(post)
            db.session.commit()
            return DeletePost(status="OK")


class Mutation(graphene.ObjectType):
    create_post = CreatePost.Field()
    update_post = UpdatePost.Field()
    delete_post = DeletePost.Field()
    signup = SignUp.Field()
    login = Login.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)