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
      userId: {
        type:Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }, 
      receiptno: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ordered: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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