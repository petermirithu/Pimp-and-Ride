'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {    
    return Promise.all([
      queryInterface.addColumn(
        'users', // table name
        'admin', // field name
        {
          type: Sequelize.BOOLEAN,    
          defaultValue: false
        },
      ),            
    ]);    
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('users', 'admin'),
    ]);    
  }
};
