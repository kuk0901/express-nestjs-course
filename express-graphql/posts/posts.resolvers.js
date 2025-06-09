const postsModel = require("./posts.model");

module.exports = {
  Query: {
    posts: () => postsModel.getAllPosts(),
    post: (_, args) => postsModel.getPostById(args.id)
  },
  Mutation: {
    addNewPost: (_, args) =>
      postsModel.addNewPost(args.id, args.title, args.description)
  }
};
