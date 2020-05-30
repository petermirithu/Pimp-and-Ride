'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('carts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      receiptno: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.INTEGER
      },
      ordered: {
        type: Sequelize.BOOLEAN
      },
      paymentmethod: {
        type: Sequelize.STRING
      },
      deliveryId: {
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'deliveries',
          key: 'id'
        }
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('carts');
  }
};