'use strict';
module.exports = (sequelize, DataTypes) => {
  const order = sequelize.define('order', {
    quantity: DataTypes.INTEGER,
    paid: DataTypes.BOOLEAN,
    productId: DataTypes.INTEGER,
    cartId: DataTypes.INTEGER
  }, {});
  order.associate = function(models) {
    order.belongsTo(models.products, {foreignKey: 'productId',as:'Product'})
    order.belongsTo(models.cart, {foreignKey: 'cartId',as:'Cart'})
  };
  return order;
};