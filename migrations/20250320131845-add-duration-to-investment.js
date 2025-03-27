'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Investment', 'duration', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Investment', 'duration');
   
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};


// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn('Investment', 'duration', {
//       type: Sequelize.INTEGER,
//       allowNull: false,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn('Investment', 'duration');
//   }
// };
