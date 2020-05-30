'use strict';
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define('cart', {
    receiptno: DataTypes.STRING,
    total: DataTypes.INTEGER,
    ordered: DataTypes.BOOLEAN,
    paymentmethod: DataTypes.STRING,
    deliveryId: DataTypes.INTEGER
    
  }, {});
  cart.associate = function(models) {
    cart.belongsTo(models.deliveries,{foreignKey: 'deliveryId', as: 'Delivery'})
    cart.hasMany(models.orders,{foreignKey:'cartId', as:'Cart'})
  };
  return cart;
};