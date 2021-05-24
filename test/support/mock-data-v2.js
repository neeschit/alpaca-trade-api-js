"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const joi = require("joi");
const { apiMethod, assertSchema, apiError } = require("./assertions");

/**
 * This server mocks http methods from the alpaca data v2 api
 * and returns 200 if the requests are formed correctly.
 *
 * This only exports a router, the actual server is created by mock-server.js
 */

module.exports = function createDataV2Mock() {
  const v2 = express.Router().use(bodyParser.json());

  v2.use((req, res, next) => {
    if (
      !req.get("APCA-API-KEY-ID") ||
      !req.get("APCA-API-SECRET-KEY") ||
      req.get("APCA-API-SECRET-KEY") === "invalid_secret"
    ) {
      next(apiError(401));
    }
    next();
  });

  v2.get(
    "/stocks/:symbol/snapshot",
    apiMethod((req) => {
      if (req.params.symbol == null) {
        throw apiError(422);
      }
      return { ...snapshots[req.params.symbol] };
    })
  );

  v2.get(
    "/stocks/snapshots",
    apiMethod((req) => {
      if (req.query.symbols == "") {
        throw apiError(422);
      }
      const syms = req.query.symbols.split(",");
      const result = syms.map(s => snapshots[s])
      return result;
    })
  );

  v2.get(
    "/stocks/:symbol/:endpoint",
    apiMethod((req) => {
      assertSchema(req.query, {
        start: joi.string().isoDate(),
        end: joi.string().isoDate(),
        limit: joi.number().integer().min(0).max(10000).optional(),
        page_token: joi.string().optional(),
        timeframe: joi.string().optional(),
        adjustment: joi.string().optional(),
      });

      let response = {
        symbol: req.params.symbol,
        next_page_token: req.query.limit > 5 ? "token" : null,
      };
      response[req.params.endpoint] = [];
      let limit = 3;
      if (req.query.limit) {
        limit = req.query.limit > 5 ? 5 : req.query.limit;
      }
      for (let i = 0; i < limit; i++) {
        response[req.params.endpoint].push(symbols[req.params.endpoint]);
      }
      return response;
    })
  );

  v2.get(
    "/stocks/:symbol/trades/latest",
    apiMethod((req) => {
      if (req.params.symbol !== latest.trade.symbol) {
        throw apiError(422);
      }
      let resp = {
        symbol: latest.trade.symbol,
        trade: latest.trade.data,
      };
      return resp;
    })
  );

  v2.get(
    "/stocks/:symbol/quotes/latest",
    apiMethod((req) => {
      if (req.params.symbol !== latest.quote.symbol) {
        throw apiError(422);
      }
      let resp = {
        symbol: latest.quote.symbol,
        quote: latest.quote.data,
      };
      return resp;
    })
  );

  return express.Router().use("/v2", v2);
};

const symbols = {
  trades: {
    t: "2021-02-08T09:00:19.932405248Z",
    x: "P",
    p: 136.68,
    s: 25,
    c: ["@", "T", "I"],
    i: 55,
    z: "C",
  },
  quotes: {
    t: "2021-02-08T09:02:07.837365238Z",
    ax: "P",
    ap: 136.81,
    as: 1,
    bx: "P",
    bp: 136.56,
    bs: 2,
    c: ["R"],
  },
  bars: {
    t: "2021-02-08T00:00:00Z",
    o: 136.11,
    h: 134.93,
    l: 136.9,
    c: 136.81,
    v: 31491496,
  },
};

const latest = {
  trade: {
    symbol: "AAPL",
    data: {
      t: "2021-04-21T13:38:01.448130014Z",
      x: "V",
      p: 131.98,
      s: 200,
      c: ["@", "F"],
      i: 814,
      z: "C",
    },
  },
  quote: {
    symbol: "FB",
    data: {
      t: "2021-04-21T13:38:02.663218404Z",
      ax: "V",
      ap: 317,
      as: 1,
      bx: "V",
      bp: 299.39,
      bs: 1,
      c: ["R"],
    },
  },
};

const snapshots = {
  FB: {
    symbol: "FB",
    latestTrade: {
      t: "2021-05-03T19:59:58.062211463Z",
      x: "V",
      p: 322.63,
      s: 130,
      c: ["@"],
      i: 7556,
      z: "C",
    },
    latestQuote: {
      t: "2021-05-03T20:00:00.000098746Z",
      ax: "V",
      ap: 0,
      as: 0,
      bx: "V",
      bp: 0,
      bs: 0,
      c: ["R"],
    },
    minuteBar: {
      t: "2021-05-03T19:59:00Z",
      o: 322.25,
      h: 322.63,
      l: 322.22,
      c: 322.63,
      v: 6394,
    },
    dailyBar: {
      t: "2021-05-03T04:00:00Z",
      o: 326.04,
      h: 328.37,
      l: 321.9,
      c: 322.63,
      v: 507529,
    },
    prevDailyBar: {
      t: "2021-04-30T04:00:00Z",
      o: 326.14,
      h: 329.78,
      l: 324.54,
      c: 324.89,
      v: 859473,
    },
  },
  AAPL: {
    symbol: "AAPL",
    latestTrade: {
      t: "2021-05-03T19:59:59.898542039Z",
      x: "V",
      p: 132.55,
      s: 100,
      c: ["@"],
      i: 12637,
      z: "C",
    },
    latestQuote: {
      t: "2021-05-03T21:00:00.006562245Z",
      ax: "V",
      ap: 0,
      as: 0,
      bx: "V",
      bp: 0,
      bs: 0,
      c: ["R"],
    },
    minuteBar: {
      t: "2021-05-03T19:59:00Z",
      o: 132.43,
      h: 132.55,
      l: 132.43,
      c: 132.55,
      v: 9736,
    },
    dailyBar: {
      t: "2021-05-03T04:00:00Z",
      o: 132.04,
      h: 134.06,
      l: 131.83,
      c: 132.55,
      v: 1364180,
    },
    prevDailyBar: {
      t: "2021-04-30T04:00:00Z",
      o: 131.8,
      h: 133.55,
      l: 131.07,
      c: 131.44,
      v: 2088793,
    },
  },
};
