require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const SpotifyStrategy = require('passport-spotify').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require("fs");
const jwt = require("jsonwebtoken");
const request = require("request");
var rp = require("request-promise-native");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
// mongoose.connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
// mongoose.set("useCreateIndex", true);

const playlistsSchema = new mongoose.Schema({
  name: String,
  id: String,
  country: String,
  link: String,
  mood: String,
  genre: String
});
const Playlist = new mongoose.model("Playlist", playlistsSchema);



var client_id = process.env.CLIENT_ID; // My client id
var client_secret = process.env.CLIENT_SECRET; // My secret
var redirect_uri = 'https://musicbridge.live/auth/spotify/callback/' //http://localhost:8888/auth/spotify/callback'; My redirect uri
var countryOfUser = '';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret
});
var spotifyProfileId = '';
var newPlaylistId = '';
passport.use(
  new SpotifyStrategy({
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: 'https://musicbridge.live/auth/spotify/callback/'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      countryOfUser = profile.country;
      spotifyApi.setAccessToken(accessToken);
      spotifyApi.setRefreshToken(refreshToken);
      spotifyProfileId = profile.id;

      process.nextTick(function() {
        return done(null, profile);
      });

    }
  )
);
const jwtToken = process.env.JWT_TOKEN;
const appleBaseUrl = "https://api.music.apple.com/v1/catalog/";

var musicUserToken = '';

app.get("/", function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    res.render("home1");
  } else {
    res.render("landingPage", {
      devKey: jwtToken
    });
  }
});

app.post("/", function(req, res) {
  musicUserToken = req.body.userToken;
  res.redirect('/');
});

app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-library-read', 'user-top-read', 'playlist-modify-private', 'playlist-read-private', 'playlist-modify-public', 'playlist-read-collaborative']
  }),
  function(req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  }
);

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

app.get('/converter', function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    res.render("converter", {
      errormessage: '',
      link: ''
    });
  } else {
    res.redirect('/');
  }
});

app.post('/converter', function(req, res) {


  let link = req.body.link;
  let universalTrackIds = [];
  let universalTrackIds2 = [];
  if (link.includes('music.apple.com', 7)) {

    //https://music.apple.com/in/playlist/chill-beats/pl.u-6mo4lG3cKbyeRL
    //https://music.apple.com/in/playlist/a-list-pop/pl.5ee8333dbe944d9f9151e97d92d1ead9
    let country = link.slice(link.lastIndexOf('.com/') + 5, link.lastIndexOf('.com/') + 7);
    let id = link.slice(link.lastIndexOf('pl.'));
    link = appleBaseUrl + country + "/playlists/" + id;

    var op = {
      url: link,
      auth: {
        bearer: jwtToken
      },
      json: true
    };
    rp(op)
      .then(function(body) {
        //let playlistImgUrl = body.data[0].attributes.artwork.url;
        let playlistName = body.data[0].attributes.name;
        //console.log(body.data[0].attributes.name);
        //let playlistDescription = body.data[0].description.standard;
        let tracks = body.data[0].relationships.tracks.data;

        tracks.forEach(function(track) {
          universalTrackIds.push(track.attributes.isrc);
        });
        console.log(universalTrackIds);
        spotifyApi.createPlaylist(spotifyProfileId, playlistName, {
            'public': true
          })
          .then(async function(data) {
              console.log('New playlist creation successful!', playlistName);
              newPlaylistId = data.body.id;
              for (let i = 0; i < universalTrackIds.length; i++) {
                await spotifyApi.searchTracks('isrc:' + universalTrackIds[i], {
                    limit: 1
                  })
                  .then(function(data) {
                    //console.log(data.body);
                    if (data.body.tracks.total !== 0) {
                      let trackUri = data.body.tracks.items[0].uri;
                      //console.log(trackUri);
                      //console.log(data.body.tracks.items[0].uri);
                      universalTrackIds2.push(trackUri);
                    }
                  }, function(err) {
                    console.log('Something went wrong!', err);
                  });


              };
              console.log(universalTrackIds2);
              spotifyApi.addTracksToPlaylist(newPlaylistId, universalTrackIds2)
                .then(function(data) {
                  console.log('Added tracks to playlist!');
                  res.render('converter', {
                    errormessage: 'Playlist has been converted successfully!',
                    link: 'https://open.spotify.com/playlist/' + newPlaylistId
                  });
                }, function(err) {
                  console.log('Something went wrong!', err);
                });

            },
            function(err) {
              res.render('converter', {
                errormessage: 'An error occurred. Please try again!',
                link: ''
              });
              console.log('Something went wrong!', err);
            });

      })
      .catch(function(err) {
        // API call failed...
        console.error("Error: ", err);
      });


    //https://api.music.apple.com/v1/catalog/{storefront}/songs
  } else if (link.includes('open.spotify.com', 7) || link.includes('link.tospotify.com', 7)) {
    //https://open.spotify.com/playlist/1iLMHSidStDkfr2rTxt8bu?si=z99CW7RFTK6bE4FzKC8adA
    //https://link.tospotify.com/bDUuTMCFRbb
    if(link.includes('open.spotify.com', 7)) {
      if (link.length > 56) {
        var id = link.slice(link.lastIndexOf('playlist/') + 9, link.indexOf('?'));
      } else {
        var id = link.slice(link.lastIndexOf('playlist/') + 9);
      }
    } else if (link.includes('link.tospotify.com', 7)) {
      var id = link.slice(link.lastIndexOf('/') + 1);
    }


    //link = 'https://api.music.apple.com/v1/me/library/playlists';

    spotifyApi.getPlaylist(id)
      .then(async function(data) {
          let playlistId = data.body.name;
          let items = data.body.tracks.items;
          for (let i = 0; i < items.length; i++) {
            universalTrackIds.push(items[i].track.external_ids.isrc);
          }
          //console.log(universalTrackIds);
          for (let i = 0; i < universalTrackIds.length; i++) {
            var op = {
              url: 'https://api.music.apple.com/v1/catalog/in/songs',
              qs: {
                'filter[isrc]': universalTrackIds[i]
              },
              auth: {
                bearer: jwtToken
              },
              json: true
            };
            await rp(op)
              .then(function(body) {
                if ((body.data).length !== 0) {
                  universalTrackIds2.push({
                    'id': body.data[0].id,
                    'type': 'songs'
                  });
                }
              })
              .catch(function(err) {
                // API call failed...
                console.error("Error: ", err);
              });
          }
          //console.log(universalTrackIds2);
          var op = {
            method: 'POST',
            url: 'https://api.music.apple.com/v1/me/library/playlists',
            auth: {
              bearer: jwtToken
            },
            headers: {
              'Music-User-Token': musicUserToken
            },
            body: {
              attributes: {
                name: playlistId,
                description: ""
              }
            },
            json: true
          };
          await rp(op)
            .then(function(body) {
              console.log("Playlist made successfully!");
              //console.log(body);
              newPlaylistId = body.data[0].id;
            })
            .catch(function(err) {
              // API call failed...
              console.error("Error: ", err);
            });

          var op = {
            method: 'POST',
            url: 'https://api.music.apple.com/v1/me/library/playlists/' + newPlaylistId + '/tracks',
            auth: {
              bearer: jwtToken
            },
            headers: {
              'Music-User-Token': musicUserToken
            },
            body: {
              data: universalTrackIds2
            },
            json: true
          };
          await rp(op)
            .then(function(body) {
              console.log("Songs successfully added to playlist!");
              res.render('converter', {
                errormessage: 'Playlist has been converted successfully!',
                link: 'https://music.apple.com/in/playlist/' + newPlaylistId
              });
            })
            .catch(function(err) {
              res.render('converter', {
                errormessage: 'An error occurred. Please try again!',
                link: ''
              });
              // API call failed...
              console.error("Error: ", err);
            });

          //console.log(universalTrackIds2);

          // res.render("converter-apple", {
          //   universalTrackIds: universalTrackIds
          // });
          //console.log('Some information about this playlist', data.body.tracks.items[0].track.external_ids.isrc);
        },
        function(err) {
          console.log('Something went wrong!', err);
        });
  }
  else {
    res.render('converter', {
      errormessage: 'Invalid link. Please try again!',
      link: ''
    });
  }
});


app.get('/newMusic', async function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    let ssongs = [];
    let asongs = [];
    let artists = [];
    await spotifyApi.getNewReleases({
        limit: 50,
        offset: 0,
        country: countryOfUser
      })
      .then(function(data) {
        for (let i = 0; i < 50; i++) {
          let artistNames = '';
          let d = 0;
          artists = data.body.albums.items[i].artists;
          for (j = 0; j < artists.length - 1; j++) {
            artistNames += artists[j].name + ', ';
            d = j + 1;
          }
          artistNames += artists[d].name
          ssongs.push({
            image: data.body.albums.items[i].images[1].url,
            name: data.body.albums.items[i].name,
            url: data.body.albums.items[i].external_urls.spotify,
            artists: artistNames
          });
        };

        // res.render("newMusic", {
        //   songs: songs
        // });
      }).catch(function(err) {
        console.log("Something went wrong!", err);
      });

    var op = {
      url: appleBaseUrl + "in/playlists/pl.2b0e6e332fdf4b7a91164da3162127b5",
      auth: {
        bearer: jwtToken
      },
      headers: {
        'Music-User-Token': musicUserToken
      },
      json: true
    };
    await rp(op)
      .then(function(body) {
        let tracks = body.data[0].relationships.tracks.data;
        for (let i = 0; i < tracks.length; i++) {
          asongs.push({
            image: tracks[i].attributes.artwork.url.replace("{w}x{h}", "325x300"),
            name: tracks[i].attributes.name,
            url: tracks[i].attributes.url,
            artists: tracks[i].attributes.artistName
          });
        }
      })
      .catch(function(err) {
        // API call failed...
        console.error("Error: ", err);
      });
    res.render("newMusic", {
      ssongs: ssongs,
      asongs: asongs
    });
  } else {
    res.redirect("/");
  }

});

async function getPlaylists() {
  let items = await Playlist.find().exec();
  return items
};

app.get('/playlist', function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    let play = [];
    let play1 = getPlaylists();
    play1.then(async function(result) {
      for (i = 0; i < result.length; i++) {
        if (result[i].id.includes('pl.')) {
          var link = appleBaseUrl + result[i].country + "/playlists/" + result[i].id;
          var op = {
            url: link,
            auth: {
              bearer: jwtToken
            },
            json: true
          };
          await rp(op)
            .then(function(body) {
              //console.log(body.data[0]);
              play.push({
                image: body.data[0].attributes.artwork.url.replace("{w}x{h}", "325x300"),
                name: body.data[0].attributes.name,
                url: body.data[0].attributes.url,
                owner: body.data[0].attributes.curatorName
              });
            })
            .catch(function(err) {
              // API call failed...
              console.error("Error: ", err);
            });
        } else {
          await spotifyApi.getPlaylist(result[i].id)
            .then(function(data) {
              play.push({
                image: data.body.images[0].url,
                description: data.body.description,
                name: data.body.name,
                url: data.body.external_urls.spotify,
                owner: data.body.owner.display_name,
                ownerProfile: data.body.owner.external_urls
              });
            }).catch(function(err) {
              console.log('Something went wrong!', err);
            });
        }

      };
      res.render("playlist", {
        playlists: play
      });
    }).catch(function(err) {
      console.log("Error: ", err);
    });
  } else {
    res.redirect("/");
  }

});


app.get('/submit', function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    res.render('playlistSubmit');
  } else {
    res.redirect('/');
  }
});

app.post('/submit', function(req, res) {
  var link = req.body.link;
  var id = '';
  var country = '';
  if (link.includes('open.spotify.com', 7)) {
    if (link.length > 56) {
      id = link.slice(link.lastIndexOf('playlist/') + 9, link.indexOf('?'));
    } else {
      id = link.slice(link.lastIndexOf('playlist/') + 9);
    }
  } else if (link.includes('music.apple.com', 7)) {
    country = link.slice(link.lastIndexOf('.com/') + 5, link.lastIndexOf('.com/') + 7);
    id = link.slice(link.lastIndexOf('pl.'));
  } else {
    res.redirect("/submit");
  }


  const playlist = new Playlist({
    name: req.body.name,
    id: id,
    country: country,
    link: link,
    mood: req.body.moods,
    genre: req.body.genres
  });

  playlist.save();
  res.redirect("/playlist");

});

app.get('/recommended', async function(req, res) {
  if(req.isAuthenticated() && musicUserToken!== ""){
    let ssongs = [];
    let asongs = [];
    let ids = [];
    let artists = [];
    let artists1 = [];
    let limit = 3;

    await spotifyApi.getMyTopArtists({
        limit: 2,
        time_range: 'short_term'
      })
      .then(function(data) {
        let topArtists = data.body.items;
        if (topArtists.length !== 0) {
          for (let i = 0; i < topArtists.length; i++) {
            artists.push(topArtists[i].id);
          }
        } else {
          limit = 5;
        }
        spotifyApi.getMyTopTracks({
            limit: limit
          })
          .then(function(data) {
            let topTracks = data.body.items;
            for (let i = 0; i < topTracks.length; i++) {
              ids.push(topTracks[i].id);
            }
            //console.log(ids);
            spotifyApi.getRecommendations({
                limit: 51,
                seed_artists: artists,
                seed_tracks: ids,
                min_popularity: 50
              })
              .then(function(data) {
                let recommendations = data.body.tracks;
                for (let i = 0; i < recommendations.length; i++) {
                  let artistNames = '';
                  let d = 0;
                  artists1 = recommendations[i].artists;
                  for (j = 0; j < artists1.length - 1; j++) {
                    artistNames += artists1[j].name + ', ';
                    d = j + 1;
                  }
                  artistNames += artists1[d].name
                  ssongs.push({
                    image: recommendations[i].album.images[1].url,
                    name: recommendations[i].name,
                    url: recommendations[i].external_urls.spotify,
                    artists: artistNames
                  });
                }
                //res.render("recommendations",{ssongs:ssongs,asongs:asongs});
              }, function(err) {
                console.log("Something went wrong!", err);
              });
          }, function(err) {
            console.log('Something went wrong!', err);
          });
        //console.log(artists);
      }, function(err) {
        console.log('Something went wrong!', err);
      });
    var op = {
      url: 'https://api.music.apple.com/v1/me/recommendations',
      qs: {
        limit: 2,
        offset: 2
      },
      auth: {
        bearer: jwtToken
      },
      headers: {
        'Music-User-Token': musicUserToken
      },
      json: true
    };
    await rp(op)
      .then(function(body) {
        let recommendations = body.data;
        for (let i = 0; i < recommendations.length; i++) {
          let data1 = recommendations[i].relationships.contents.data;
          for (let k = 0; k < data1.length; k++) {
            if (data1[k].type === "albums") {
              asongs.push({
                image: data1[k].attributes.artwork.url.replace("{w}x{h}", "325x300"),
                name: data1[k].attributes.name,
                url: data1[k].attributes.url,
                artists: data1[k].attributes.artistName
              });
            } else if (data1[k].type === "playlists") {
              asongs.push({
                image: data1[k].attributes.artwork.url.replace("{w}x{h}", "325x300"),
                name: data1[k].attributes.name,
                url: data1[k].attributes.url,
                artists: data1[k].attributes.curatorName
              });
            }
          }
        }
        //res.render("recommendations",{ssongs:ssongs,asongs:asongs});
      })
      .catch(function(err) {
        // API call failed...
        console.error("Error: ", err);
      });
    res.render("recommendations", {
      ssongs: ssongs,
      asongs: asongs
    });
  } else {
    res.redirect("/");
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

// app.listen(port, function() {
//   console.log('Server started successfully');
// });
connectDB().then(() => {
  app.listen(port, () => {
    console.log("listening for requests");
  });
});