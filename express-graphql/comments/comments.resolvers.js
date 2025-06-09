const commentsModel = require("./comments.model");

module.exports = {
  Query: {
    comments: () => commentsModel.getAllComments(),
    commentsByLikes: (_, args) =>
      commentsModel.getCommentsByLikes(args.minLikes)
  },
  Mutation: {
    addNewComment: (_, args) => commentsModel.addNewComment(args.id, args.text)
  }
};
