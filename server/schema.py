from models import Post, User
import graphene
from graphql import GraphQLError
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField
from db import db


class PostObject(SQLAlchemyObjectType):
    class Meta:
        model = Post
        interfaces = (graphene.relay.Node, )


class UserObject(SQLAlchemyObjectType):
   class Meta:
       model = User
       interfaces = (graphene.relay.Node, )
       exclude_fields = ('password_hash')


class Query(graphene.ObjectType):
    node = graphene.relay.Node.Field()
    all_posts = SQLAlchemyConnectionField(PostObject)
    all_users = SQLAlchemyConnectionField(UserObject)


class SignUp(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(lambda: UserObject)
    auth_token = graphene.String()
    def mutate(self, info, username, password):
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return SignUp(user=user, auth_token=user.encode_auth_token(user.uuid).decode())


class Login(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    user = graphene.Field(lambda: UserObject)
    auth_token = graphene.String()
    def mutate(self, info, username, password):
        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            raise GraphQLError("Invalid Credentials")
        return Login(user=user, auth_token=user.encode_auth_token(user.uuid).decode())


class CreatePost(graphene.Mutation):
    class Arguments:
        title = graphene.String(required=True)
        body = graphene.String(required=True) 
        username = graphene.String(required=True)
    post = graphene.Field(lambda: PostObject)
    def mutate(self, info, title, body, username):
        user = User.query.filter_by(username=username).first()
        post = Post(title=title, body=body)
        if user is not None:
            post.author = user
        db.session.add(post)
        db.session.commit()
        return CreatePost(post=post)


class Mutation(graphene.ObjectType):
    create_post = CreatePost.Field()
    signup = SignUp.Field()
    login = Login.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)