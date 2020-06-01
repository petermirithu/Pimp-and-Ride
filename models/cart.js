'use strict';
module.exports = (sequelize, DataTypes) => {
  const cart = sequelize.define('cart', {
    userId:DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    ordered: DataTypes.BOOLEAN,
    paymentmethod: DataTypes.STRING,
    deliveryId: DataTypes.INTEGER,
    MerchantRequestID: DataTypes.STRING,
    phoneno: DataTypes.STRING,    
  }, {});
  cart.associate = function(models) {
    cart.belongsTo(models.users,{foreignKey: 'userId', as: 'User'}),
    cart.belongsTo(models.delivery,{foreignKey: 'deliveryId', as: 'Delivery'}),
    cart.hasMany(models.order,{foreignKey:'cartId', as:'Cart'})
  };
  return cart;
};
