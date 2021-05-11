const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  date = req.query.date; //2021-05-9
  getMatches(date).then((result) => res.send(result));
});

app.listen(PORT);

const getMatches = async (date) => {
  const URL = date
    ? `https://onefootball.com/en/matches?date=${encodeURIComponent(date)}`
    : `https://onefootball.com/en/matches`;
  const response = await axios.get(URL);

  const $ = cheerio.load(response.data);
  let league = "";
  matches = [];

  $(
    ".xpa-layout-matches__section.xpa-layout-matches__section--matchCardsList"
  ).each((a, element1) => {
    league = $(element1)
      .find(".section-header .section-header__titles-container h2")
      .html();
    //console.log(league);
    $(element1)
      .find(`li.simple-match-cards-list__match-card`)
      .each((i, element2) => {
        $(element2).each((j, el3) => {
          matches.push({
            league,
            ...getTeamsData($, el3),
            ...getMatchesTimes($, el3),
          });
        });
      });
  });
  return matches;
};

const getTeamsData = ($, element) => {
  const teamHome = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content span.title-8-medium.simple-match-card-team__name`
    )
    .html();

  const teamHomeScore = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content span.title-7-bold.simple-match-card-team__score`
    )
    .html();

  const teamHomeLogo = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content of-entity-logo.simple-match-card-team__logo .of-image__picture`
    )
    .children()
    .attr("srcset");

  const teamAway = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content:nth-of-type(2) span.title-8-medium.simple-match-card-team__name 
          `
    )
    .html();

  const teamAwayScore = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content:nth-of-type(2) span.title-7-bold.simple-match-card-team__score 
          `
    )
    .html();

  const teamAwayLogo = $(element)
    .find(
      `div.simple-match-card__teams-content of-simple-match-card-team.simple-match-card__team-content:nth-of-type(2) of-entity-logo.simple-match-card-team__logo .of-image__picture`
    )
    .children()
    .attr("srcset");

  return {
    teamHome,
    teamHomeScore,
    teamHomeLogo,
    teamAway,
    teamAwayScore,
    teamAwayLogo,
  };
};

const getMatchesTimes = ($, element) => {
  if (
    $(element)
      .find(
        `.simple-match-card__match-content .title-8-bold.simple-match-card__live`
      )
      .html()
  ) {
    return {
      liveScore: $(element)
        .find(
          `.simple-match-card__match-content .title-8-bold.simple-match-card__live`
        )
        .html(),
    };
  } else {
    return {
      matchDate: $(element)
        .find(`.simple-match-card__match-content time`)
        .html(),
      status: $(element)
        .find(`.simple-match-card__match-content time~span`)
        .html(),
    };
  }
};
