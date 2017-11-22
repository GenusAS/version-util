const request = require('request')

const versionServiceUrl = 'http://ci-lnxbuilder.genus.biz:3000/'

const getBranches = (repoId) =>
	new Promise((resolve, reject) => {
		let url = versionServiceUrl + 'repos/' + repoId + '/branches'

		request(url, (error, response, body) => {
			let branches = JSON.parse(body).map(branch => branch.name)

			resolve(branches)
		})
	})

const checkRepo = (repoId, repos) =>
	new Promise((resolve, reject) => {
		if (repos.some(repo => repo.id === repoId)) {
			console.log("Repo with repoId " + repoId + " exists: " + repo.name)
			resolve(repoId)
		} else {
			reject("Invalid repo id")
		}
	})
/**
 * Resolves with an array of all repos from the gitlab server. 
 */
const getRepos = () =>
	new Promise((resolve, reject) => {
		let url = versionServiceUrl + "repos"
		console.log("Getting repos...")
		request(url, (error, response, body) => {
			let repos = JSON.parse(body)

			if (repos) {
				resolve(repos)
			}
			else {
				reject("No repos")
			}
		})
	})


/**
 * Takes a branch name and checks that towards the result of getBranches. If it is among the branches, the promise resolves,
 * if not, it rejects
 * 
 */
const checkBranch = (repoId, branch) =>

	new Promise((resolve, reject) => {
		getRepos()
			.then(checkRepo.bind(null, repoId))
			.then(getBranches)
			.then((validBranches) => {

				if (validBranches.some(item => item === branch)) {
					console.log(branch + ' exists')
					resolve(repoId, branch)
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
 * @param {*} branch 
 */
const getVersionNumber = (repoId, branch) =>
	new Promise((resolve, reject) => {
		console.log('Getting version number from version service for repo ' + repoId)

		let url = versionServiceUrl + 'builder/' + repoId + '/?branch=' + branch

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

exports.getRepos = getRepos
exports.checkBranch = checkBranch
exports.getVersionNumber = getVersionNumber