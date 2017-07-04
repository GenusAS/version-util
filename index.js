const request = require('request')

const versionServiceUrl = 'http://ci-lnxbuilder.genus.biz:3000/'

const getBranches = () =>
	new Promise((resolve, reject) => {
		let url = versionServiceUrl + 'repos/24/branches'

		request(url, (error, response, body) => {
			let branches = JSON.parse(body).map(branch => branch.name)

			resolve(branches)
		})
	})

/**
 * Takes a branch name and checks that towards the result of getBranches. If it is among the branches, the promise resolves,
 * if not, it rejects
 * 
 */
exports.checkBranch = branch =>
	new Promise((resolve, reject) => {
		getBranches().then(function(validBranches) {
			if (validBranches.some(item => item === branch)) {
				console.log(branch + ' exists')
				resolve(branch)
			} else {
				reject('Branch ' + branch + ' does not exist')
				return
			}
		})
	})

/** 
 * Will call the version service to require about the latest version number of a given branch.
 * @param {*} branch 
 */
exports.getVersionNumber = branch =>
	new Promise((resolve, reject) => {
		console.log('Getting version number from version service')

		let url = versionServiceUrl + 'builder/24/?branch=' + branch

		request(url, (error, response, body) => {
			if (error) {
				console.log('ERROR')
				reject()
				throw new Error(error)
			}
			const result = JSON.parse(body)

			if (result.err) {
				reject()
				throw new Error(result.err)
			}

			resolve(result.version)
		})
	})
