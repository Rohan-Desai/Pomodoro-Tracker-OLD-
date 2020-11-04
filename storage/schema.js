const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  name: String
});

const taskSchema = new Schema({
  description: String,
  userId: {type: Schema.Types.ObjectId, ref: 'User'},
  completed: Boolean,
  timeSpent: Number,
  parentTask: {type: Schema.Types.ObjectId, ref: 'Task'}
});

module.exports = {
	User:  mongoose.model('User', userSchema),
	Task:  mongoose.model('Task', taskSchema)
};