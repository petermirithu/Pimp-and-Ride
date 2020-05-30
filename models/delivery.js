'use strict';
module.exports = (sequelize, DataTypes) => {
  const delivery = sequelize.define('delivery', {
    name: DataTypes.STRING,
    cost: DataTypes.INTEGER
  }, {});
  delivery.associate = function(models) {
    // associations can be defined here
  };
  return delivery;
};