#!/usr/bin/env node
const request = require('request')
const program = require('commander')
const fs      = require('fs')


const getVersionNumber = require('./functions/versionService').getVersionNumber
const checkBranch      = require('./functions/versionService').checkBranch


program
    .version('0.0.1')
    .option('-b, --branch [branch]', 'Git branch')
    .option('-d, --destination [path]', 'Destination')


program
    .command('get')
    .description('Gets the version number')
    .action(function(cmd, options) {
        console.log("Gets the version number")

        let branch = program.branch || process.env.CI_COMMIT_REF_NAME

        checkBranch(branch)
            .then(getVersionNumber)
            .then(function(version){
            
                if (program.destination) {
                    fs.writeFile(program.destination, version, function(err){
                        if (err){
                            throw err
                        }
                        console.log("Versionnumber saved in " + program.destination )
                    })
                } else {

                    console.log(version)
                }
            })
            .catch(function(err) {
                console.error("ERROR: " + err)
            })
    })



program.parse(process.argv)