'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {    
    return Promise.all([
      queryInterface.addColumn(
        'carts', // table name
        'phoneno', // field name
        {
          type: Sequelize.STRING,    
          allowNull: true,
        },
      ),            
    ]);    
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('carts', 'phoneno'),
    ]);    
  }
};
