'use strict';

import config from '../config/index.js';
import { expect } from 'chai';
import sinon from 'sinon';
// eslint-disable-next-line no-unused-vars
import { UserRepo, UserRepoSingleton } from './user-repo.js';
import { SequelizeSingleton } from './foundation/sequalize.js';
// eslint-disable-next-line no-unused-vars
import { Sequelize } from 'sequelize';






describe('UserRepo Test suites', function () {


  /**
   * @type {UserRepo}
  */
  let mUserRepo;


  beforeEach( async function() {

    mUserRepo = await UserRepoSingleton.geUserRepoInstance();
    if( !mUserRepo ) {
      config.loggman.error(`can't create a mUserRepo instance`);
      this.skip();
    }
    await mUserRepo.syncSchemaWithDatabase();
  });


  afterEach( async function() {

    sinon.restore();
    if( !mUserRepo ) this.skip();

    /**
     * @type {Sequelize}
    */
    const sequalize = await SequelizeSingleton.getInstance();
    await sequalize.drop();

  });


  describe('#UserRepo user registration', function() {

    it( 'should create a new user with the specified name', async function() {

      const name = 'Bob';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel.name).to.equal(name);
      expect(userModel.id).to.not.empty;
    });


    it( 'should create another new user with the specified name', async function() {

      const name = 'Jane';
      const userModel = await mUserRepo.registerUser( name);
      expect(userModel.name).to.equal(name);
      expect(userModel.id).to.not.empty;
    });


    it( 'should bulk create twp users', async function() {

      const names = ['Bob', 'Jane'];
      const userModels = await mUserRepo.bulkRegisterUser(names);
      expect(userModels.length).eqls(2);
      expect(userModels[0].name).to.equal(names[0]);
      expect(userModels[0].id).to.not.empty;
    });

  });


  describe('#UserRepo user retrieval', function() {

    it( 'should return the last registered user', async function() {

      const name = 'Bob';
      const registeredUser = await mUserRepo.registerUser( name);

      const foundUser = await mUserRepo.getByID(registeredUser.id);
      expect(foundUser).to.not.null;
      expect(foundUser.name).eqls( name);

    })

  });

});