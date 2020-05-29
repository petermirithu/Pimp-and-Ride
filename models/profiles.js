'use strict';
module.exports = (sequelize, DataTypes) => {
  const profiles = sequelize.define('profiles', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    profile_pic: DataTypes.STRING,
    about: DataTypes.STRING,
    userId: DataTypes.INTEGER
  }, {});
  profiles.associate = function(models) {
    profiles.belongsTo(models.users,{foreignKey: 'userId', as: 'User'})
  };
  return profiles;
};