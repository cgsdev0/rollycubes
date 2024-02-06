#ifndef INCLUDE_METRICS_H
#define INCLUDE_METRICS_H

#include <prometheus/counter.h>
#include <prometheus/registry.h>
#include <prometheus/text_serializer.h>
#include <functional>

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

  }

  prometheus::Gauge *ws_counter;
  prometheus::Counter *game_counter_private;
  prometheus::Counter *game_counter_public;
  prometheus::Counter *rolls;
  prometheus::Counter *restarts;

  private:
  std::shared_ptr<prometheus::Registry> registry;
};
#endif
