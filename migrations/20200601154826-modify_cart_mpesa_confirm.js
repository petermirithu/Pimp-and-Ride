'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {    
    return Promise.all([
      queryInterface.addColumn(
        'carts', // table name
        'mpesa_confirm', // field name
        {
          type: Sequelize.BOOLEAN,    
          defaultValue: false
        },
      ),            
    ]);    
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('carts', 'mpesa_confirm'),
    ]);    
  }
};
