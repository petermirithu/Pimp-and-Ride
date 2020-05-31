'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {    
    return Promise.all([
      queryInterface.changeColumn(
        'carts', // table name
        'deliveryId', // field name
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      ),            
    ]);    
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('cart', 'deliveryId'),
    ]);    
  }
};
