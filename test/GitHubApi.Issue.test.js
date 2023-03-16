const { StatusCodes } = require('http-status-codes');
const { expect } = require('chai');
const axios = require('axios');

const urlBase = 'https://api.github.com';
const githubUserName = 'TheLordJuanes';
const repository = 'axios-api-testing-exercise';

describe('Github Api Test', () => {
    describe('Process of obtaining a user and then verifying the existence of a repository of it', () => {
        let username;

        before(async () => {
            const response = await axios.get(`${urlBase}/user`, {
                headers: {
                    Authorization: `token ${process.env.ACCESS_TOKEN}`
                }
            });

            expect(response.status).to.equal(StatusCodes.OK);
            username = response.data.login;
        });

        it('Exists repository ' + repository + ' for user ' + githubUserName, async () => {
            console.log(username);
            const response = await axios.get(`${urlBase}/repos/${username}/${repository}`, {
                headers: {
                    Authorization: `token ${process.env.ACCESS_TOKEN}`
                }
            });

            expect(response.status).to.equal(StatusCodes.OK);
        });
    });

    describe('Process of creating an issue containing only one title for a user in one of their repositories', () => {
        const issue = {
            owner: githubUserName,
            repo: repository,
            title: 'Found a bug'
        };

        it('Issue should be created in repository ' + repository + ' for user ' + githubUserName + ', has only a title without body', async () => {
            const response = await axios.post(`${urlBase}/repos/${githubUserName}/${repository}/issues`, issue, {
                headers: {
                    Authorization: `token ${process.env.ACCESS_TOKEN}`
                }
            });

            expect(response.status).to.equal(StatusCodes.CREATED);
            expect(response.data).to.have.property("title").equal(issue.title);
            expect(response.data.body).not.exist;
        });
    });

    describe('Manipulating an issue', () => {
        let issueNumber;

        beforeEach(async () => {
            const response = await axios.get(`${urlBase}/repos/${githubUserName}/${repository}/issues`, {
                headers: {
                    Authorization: `token ${process.env.ACCESS_TOKEN}`
                }
            });

            expect(response.status).to.equal(StatusCodes.OK);
            issueNumber = response.data[0].number;
        });

        describe('Process of modifying a repository issue for a user, adding a body to it', () => {
            const issue = {
                body : 'This is the new body of the issue'
            };

            it('Issue should be modified in repository ' + repository + ' for user ' + githubUserName + ', with the new body and the same title', async () => {
                const response = await axios.patch(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}`, issue, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    },
                });

                expect(response.status).to.equal(StatusCodes.OK);

                const res = await axios.get(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}`, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    }
                });

                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.data.title).to.equal(response.data.title);
                expect(res.data).to.have.property("body").equal(issue.body);
            });
        });

        describe('Process of locking an repository issue for user, specifying the reason', () => {
            const issue = {
                owner : githubUserName,
                repo : repository,
                issue_number : issueNumber,
                lock_reason : 'resolved'
            };

            it('Issue should be locked in repository ' + repository + ' for user ' + githubUserName, async () => {
                const response = await axios.put(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}/lock`, issue, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    }
                });

                expect(response.status).to.equal(StatusCodes.NO_CONTENT);

                const res = await axios.get(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}`, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    }
                });

                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.data).to.have.property("active_lock_reason").equal(issue.lock_reason);
                expect(res.data.locked).to.equal(true);
            });
        });

        describe('Process of unlocking a repository issue for user', () => {
            it('Issue should be unlocked in repository ' + repository + ' for user ' + githubUserName, async () => {
                const response = await axios.delete(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}/lock`, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    }
                });

                expect(response.status).to.equal(StatusCodes.NO_CONTENT);

                const res = await axios.get(`${urlBase}/repos/${githubUserName}/${repository}/issues/${issueNumber}`, {
                    headers: {
                        Authorization: `token ${process.env.ACCESS_TOKEN}`
                    }
                });

                expect(res.status).to.equal(StatusCodes.OK);
                expect(res.data.locked).to.equal(false);
            });
        });
    });
});