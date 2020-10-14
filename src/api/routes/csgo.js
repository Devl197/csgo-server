const express = require("express");
const axios = require('axios');
const router = express.Router();
const { isObjectEmpty, transformStatsData } = require('../functions/csgo');

const API_KEY = process.env.API_KEY;

router.get('/user/:id', async (req, res) => {
    try{
        const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${API_KEY}&steamids=${req.params.id}`;
        const response = await axios.get(url);

        if(response.data.response.players.length === 0){
            res.status(404).json({msg: 'User not found'});
        } else {
            res.status(200).json(response.data.response.players[0]);
        } 
    } catch(error) {
        res.status(error.response.status).json({msg: error.message});
    }
});

router.get('/user/vanityurl/:name', async (req, res) => {
    try {
        const url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${API_KEY}&vanityurl=${req.params.name}`;
        const response = await axios.get(url);

        if(response.data.response.success === 42) {
            res.status(404).json({msg: 'User not found'});
        } else {
            res.status(200).json({id: response.data.response.steamid});
        }
    } catch (error) {
        res.status(error.response.status).json({msg: error.message});
    }
});

router.get('/user/stats/:id', async (req, res) => {
    try {
        const url = `https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=730&key=${API_KEY}&steamid=${req.params.id}`;
        let response = await axios.get(url);
        response = transformStatsData(response.data);
        res.status(200).json(response);
    } catch (error) {
        res.status(error.response.status).json({msg: error.message});
    }
});

router.get('/user/:id/ownsgame', async (req, res) => {
    try {
        const options = {
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            params: {
                input_json: {
                    "steamid": req.params.id,
                    "appids_filter": [730],
                },
                format: "json", 
            }
        }
        const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}`;
        const response = await axios.get(url, options);
        if(isObjectEmpty(response.data.response)){
            res.status(200).json({response: false});
        } else {
            res.status(200).json({response: true});
        }
    } catch (error) {
        res.status(error.response.status).json({msg: error.message});
    }
});

module.exports = router;
