var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Game'}]
});

mongoose.model('User', userSchema);
