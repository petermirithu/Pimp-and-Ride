'use strict';
module.exports = (sequelize, DataTypes) => {
  const products = sequelize.define('products', {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    price: DataTypes.INTEGER,
    description: DataTypes.STRING,
    categoryId: DataTypes.INTEGER
  }, {});
  products.associate = function(models) {
    products.belongsTo(models.category,{foreignKey: 'categoryId', as: 'Category'})
  };
  return products;
};