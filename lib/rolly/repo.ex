defmodule Rolly.Repo do
  use Ecto.Repo,
    otp_app: :rolly,
    adapter: Ecto.Adapters.Postgres
end
