var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  title: String,
  platform: String,
  developer: String,
  genre: String
  fans: [{ type: Schema.Types.ObjectId, ref: 'User'}]
});

mongoose.model('Game', gameSchema);
