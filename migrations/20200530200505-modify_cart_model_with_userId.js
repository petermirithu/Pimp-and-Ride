'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'carts', // table name
        'userId', // new field name
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      ),            
    ]);    
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('cart', 'userId'),
    ]);  
  }
};
