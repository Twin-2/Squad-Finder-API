'use strict'

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET = process.env.SECRET;

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define("Users", {
    username: { type: DataTypes.STRING,
    required: true,
    unique: true },
    password: { type: DataTypes.STRING,
    required: true },
    bio: { type: DataTypes.STRING,
    required: false,
    unique: false },
    likedGames: { type: DataTypes.STRING,
    require: false,
    unique: false },
    //matches/friends
    role: { type: DataTypes.ENUM('user', 'writer', 'editor', 'admin'),
    required: true,
    defaultValue: 'editor' },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET);
      },
      set(jwtToken) {
        let token = jwt.sign(jwtToken, SECRET);
        return token;
      }
    },
    permissions: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          user: ['read'],
          writer: ['read', 'create'],
          editor: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete']
        };
        return acl[this.role]
      }
    }
  });

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('User Invalid');
  }

  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = await this.findOne({ where: { username: parsedToken.username } });
      if (user) { return user; }
      throw new Error('User Not Found');
    } catch (e) {
      throw new Error(e.message)
    }
  }
  return model;
}

module.exports = userSchema; 
