#ifndef INCLUDE_RICH_TEXT_STREAM_H
#define INCLUDE_RICH_TEXT_STREAM_H

#include "api/API.hpp"
#include <vector>
#include <variant>
#include <string>
#include <optional>

static inline bool isSignedIn(const API::ServerPlayer &player) {
    return (player.session.find("guest:") != 0);
}

namespace RT {
  typedef int Modifier_t;

  struct color {
      color(const std::string& str) {
        this->col = str;
      }
      std::string col;
  };
}

class RichTextStream {
  public:

  std::string str() const {
    return msg.toString();
  }

  const API::RichTextMsg& obj() const {
    return msg;
  }

  RichTextStream& operator<<(const API::ServerPlayer& obj)
  {
      this->msg.msg.emplace_back<API::RichTextChunk>({
            .alignment = this->alignment,
            .color = this->color,
            .modifiers = this->modifiers,
            .text = obj.name.value_or("guest"),
            .type = API::RichTextChunkType::RT_USERNAME,
            .user_id = isSignedIn(obj) ?
              std::optional<std::string>(obj.session) : std::nullopt,
          });
    return *this;
  }
  RichTextStream& operator<<(const std::string& obj)
  {
      if (!this->modifiers.has_value()
          && !this->alignment.has_value()
          && !this->color.has_value()) {
        this->msg.msg.push_back(obj);
      }
      else {
        this->msg.msg.emplace_back<API::RichTextChunk>({
            .alignment = this->alignment,
            .color = this->color,
            .modifiers = this->modifiers,
            .text = obj,
            .user_id = std::nullopt,
          });
      }
      return *this;
  }

  RichTextStream& operator<<(const RT::color& obj)
  {
    if (!this->color.has_value()) {
      this->color = std::optional<std::string>{};
    }
    this->color = obj.col;
    return *this;
  }

  RichTextStream& operator<<(const RT::Modifier_t& obj)
  {
    if (!this->modifiers.has_value()) {
      this->modifiers = std::make_optional<std::vector<API::Modifier>>();
    }
    switch(obj) {
      case 1:
        this->modifiers.value().push_back(API::Modifier::BOLD);
        break;
      case 2:
        this->modifiers.value().push_back(API::Modifier::UNDERLINE);
        break;
      case 3:
        this->modifiers.value().push_back(API::Modifier::STRIKETHROUGH);
        break;
      case 4:
        this->modifiers.value().push_back(API::Modifier::ITALIC);
        break;
    }
      return *this;
  }

  RichTextStream& operator<<( void (*pf)(RichTextStream&) ) {
    this->color = std::nullopt;
    this->modifiers = std::nullopt;
    this->alignment = std::nullopt;
    return *this;
  }

  private:
    std::optional<API::Alignment> alignment;
    std::optional<std::string> color;
    std::optional<std::vector<API::Modifier>> modifiers;
    API::RichTextMsg msg;
};

namespace RT {
  static void reset(RichTextStream& os) {
  }
  const RT::Modifier_t bold = 1;
  const RT::Modifier_t underline = 2;
  const RT::Modifier_t strike = 3;
  const RT::Modifier_t italic = 4;
}

#endif
