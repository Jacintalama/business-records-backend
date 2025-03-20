'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Barangays', [
      { name: 'Malbang', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nomoh', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Seven Hills', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pananag', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Daliao', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Colon', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Amsipit', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bales', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kamanga', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kablacan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kanalo', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lumatil', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lumasal', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tinoto', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Public Market', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pobalcion', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kabatiol', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Barangays', null, {});
  }
};
