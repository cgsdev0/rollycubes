#ifndef INCLUDE_METRICS_H
#define INCLUDE_METRICS_H

#include <functional>
#include <map>
#include <prometheus/counter.h>
#include <prometheus/registry.h>
#include <prometheus/text_serializer.h>
#include <vector>

struct Metrics {

    Metrics(std::shared_ptr<prometheus::Registry> _registry) : registry(_registry) {

        ws_counter = &prometheus::BuildGauge()
                          .Name("websocket_conn_total")
                          .Help("Number of websocket connections total")
                          .Register(*registry)
                          .Add({});

        auto &game_counter = prometheus::BuildCounter()
                                 .Name("games_created_total")
                                 .Help("Number of new games created")
                                 .Register(*registry);

        game_counter_private = &game_counter
                                    .Add({{"private", "true"}});

        game_counter_public = &game_counter
                                   .Add({{"private", "false"}});

        rolls = &prometheus::BuildCounter()
                     .Name("rolls_total")
                     .Help("Count of rolls")
                     .Register(*registry)
                     .Add({});

        restarts = &prometheus::BuildCounter()
                        .Name("restarts_total")
                        .Help("Count of new games started")
                        .Register(*registry)
                        .Add({});

        auto &specific_rolls_family = prometheus::BuildCounter()
                                          .Name("specific_roll_total")
                                          .Help("Count of a particular roll")
                                          .Register(*registry);

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "1"}, {"total", "2"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "2"}, {"total", "3"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "3"}, {"total", "4"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "4"}, {"total", "5"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "5"}, {"total", "6"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "1"}, {"die2", "6"}, {"total", "7"}}));

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "1"}, {"total", "3"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "2"}, {"total", "4"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "3"}, {"total", "5"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "4"}, {"total", "6"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "5"}, {"total", "7"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "2"}, {"die2", "6"}, {"total", "8"}}));

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "1"}, {"total", "4"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "2"}, {"total", "5"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "3"}, {"total", "6"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "4"}, {"total", "7"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "5"}, {"total", "8"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "3"}, {"die2", "6"}, {"total", "9"}}));

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "1"}, {"total", "5"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "2"}, {"total", "6"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "3"}, {"total", "7"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "4"}, {"total", "8"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "5"}, {"total", "9"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "4"}, {"die2", "6"}, {"total", "10"}}));

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "1"}, {"total", "6"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "2"}, {"total", "7"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "3"}, {"total", "8"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "4"}, {"total", "9"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "5"}, {"total", "10"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "5"}, {"die2", "6"}, {"total", "11"}}));

        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "1"}, {"total", "7"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "2"}, {"total", "8"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "3"}, {"total", "9"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "4"}, {"total", "10"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "5"}, {"total", "11"}}));
        specific_rolls.push_back(&specific_rolls_family.Add({{"die1", "6"}, {"die2", "6"}, {"total", "12"}}));

        auto &wins_family = prometheus::BuildCounter()
                                .Name("wins_total")
                                .Help("Count of a wins")
                                .Register(*registry);

        wins[33] = &wins_family.Add({{"score", "33"}});
        wins[66] = &wins_family.Add({{"score", "66"}});
        wins[67] = &wins_family.Add({{"score", "67"}});
        wins[98] = &wins_family.Add({{"score", "98"}});
        wins[99] = &wins_family.Add({{"score", "99"}});
        wins[100] = &wins_family.Add({{"score", "100"}});
    }

    prometheus::Gauge *ws_counter;
    prometheus::Counter *game_counter_private;
    prometheus::Counter *game_counter_public;
    prometheus::Counter *rolls;
    prometheus::Counter *restarts;
    std::vector<prometheus::Counter *> specific_rolls;
    std::map<int, prometheus::Counter *> wins;

  private:
    std::shared_ptr<prometheus::Registry> registry;
};
#endif
