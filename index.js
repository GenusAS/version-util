const request = require('request')

const versionServiceUrl = 'http://ci-lnxbuilder.genus.biz:3000/'


/**
 * Returns a promise that resolved with the provided repoId if it is valid, or an error string if it is not found. 
 * @param {*} repoId 
 * @param {*} repos 
 */
const checkRepo = (repoId, repos) =>
	new Promise((resolve, reject) => {
		if (repos.some(repo => repo.id == repoId)) {
			console.log("Repo with repoId " + repoId + " exists")
			resolve(repoId)
		} else {
			reject("Invalid repo id")
		}
	})


/**
 * Returns a promise that resolves with an array of all repos from the gitlab server. 
 */
const getRepos = () =>
	new Promise((resolve, reject) => {
		const url = versionServiceUrl + "repos"
		console.log("Getting repos...")
		request(url, (error, response, body) => {
			if (error) {
				console.log('ERROR')
				reject(error)
				return
			}
			const result = JSON.parse(body)

			if (result.err) {
				reject(error)
				return
			}

			const repos = JSON.parse(body)

			if (repos) {
				resolve(repos)
			}
			else {
				reject("No repos")
			}
		})
	})

/**
 * Returns a promise that resolves with an array of branches in the given repo
 * @param {*} repoId 
 */
const getBranches = (repoId) =>
	new Promise((resolve, reject) => {
		const url = versionServiceUrl + 'repos/' + repoId + '/branches'

		request(url, (error, response, body) => {
			if (error) {
				console.log('ERROR')
				reject(error)
				return
			}
			const result = JSON.parse(body)

			if (result.err) {
				reject(error)
				return
			}

			const branches = JSON.parse(body).map(branch => branch.name)

			resolve(branches)
		})
	})


/**
 * Takes a branch name and checks that towards the result of getBranches. If it is among the branches, the promise resolves, if not, it rejects
 * @param {*} repoId 
 * @param {*} branch 
 */
const checkBranch = (repoId, branch) =>

	new Promise((resolve, reject) => {
		getRepos()
			.then(checkRepo.bind(null, repoId))
			.then(getBranches)
			.then((validBranches) => {

				if (validBranches.some(item => item === branch)) {
					console.log(branch + ' exists')
					resolve({
						repoId,
						branch
					})
				} else {
					reject('Branch ' + branch + ' does not exist')
					return
				}
			})
			.catch(function (err) {
				console.error("ERROR: " + err)
			})
	})

/**
 * Will call the version service to require about the latest version number of a given branch.
 * @param {repoId, branch} Object consisting of repoId and branch name 
 */
const getVersionNumber = (input) =>
	new Promise((resolve, reject) => {
		const repoId = input.repoId
		const branch = input.branch
		console.log('Getting version number from version service for repo ' + repoId)

		const url = versionServiceUrl + 'builder/' + repoId + '/?branch=' + branch

		request(url, (error, response, body) => {
			if (error) {
				console.log('ERROR')
				reject(error)
				return
			}
			const result = JSON.parse(body)

			if (result.err) {
				reject(error)
				return
			}

			resolve(result.version)
		})
	})

/**
 * Increments the version number and resolves with the new version number
 * @param {repoId, branch} Object consisting of repoId and branch name 
 */
const incrementVersionNumber = (input) => {
	new Promise((resolve, reject) => {
		const repoId = input.repoId
		const branch = input.branch

		console.log('Getting version number from version service for repo ' + repoId)

		const url = versionServiceUrl + 'builder/' + repoId + '/?branch=' + branch

		request.post(url, (error, response, body) => {
			if (error) {
				console.log('ERROR')
				reject(error)
				return
			}
			const result = JSON.parse(body)

			if (result.err) {
				reject(error)
				return
			}

			resolve(result.version)
		})
	})
}

exports.getBranches = getBranches
exports.checkRepo = checkRepo
exports.getRepos = getRepos
exports.checkBranch = checkBranch
exports.getVersionNumber = getVersionNumber
exports.incrementVersionNumber = incrementVersionNumber
