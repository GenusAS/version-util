const assert = require('assert')
const versionUtil = require("../index")

describe('versionUtil', function () {
	describe('getRepos', function () {
		let repos
		before((function (done) {
			versionUtil.getRepos().then(function (allRepos) {
				repos = allRepos
				done()
			})
		}))
		it('Should resolve with an array of repositories', function () {
			assert.equal(Array.isArray(repos), true)
		})
		it('Should have more than 0 values', function () {
			assert(repos.length > 0)
		})

		describe('checkRepo', function () {
			it("Should resolve with the same repo Id if it is valid", function () {
				versionUtil.checkRepo(33, repos).then(function (repoId) {

					assert.equal(33, repoId)
				})
			})
			it("Should reject with errormessage if invalid repo Id", function () {
				versionUtil.checkRepo(-1, repos).catch(function (err) {

					assert.equal("Invalid repo id", err)
				})
			})
		})
	})


	describe('getBranches', function () {
		it("Should resolve with an array of branch names", function () {

			versionUtil.getBranches(33).then(function (branches) {
				assert.equal(Array.isArray(branches), true)
			})
		})

	})

})