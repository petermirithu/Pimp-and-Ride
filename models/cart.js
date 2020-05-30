'use strict';
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define('cart', {
    userId:DataTypes.INTEGER,
    receiptno: DataTypes.STRING,
    total: DataTypes.INTEGER,
    ordered: DataTypes.BOOLEAN,
    paymentmethod: DataTypes.STRING,
    deliveryId: DataTypes.INTEGER
    
  }, {});
  cart.associate = function(models) {
    cart.belongsTo(models.users,{foreignKey: 'userId', as: 'User'}),
    cart.belongsTo(models.delivery,{foreignKey: 'deliveryId', as: 'Delivery'}),
    cart.hasMany(models.order,{foreignKey:'cartId', as:'Cart'})
  };
  return cart;
};