{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
  flake-utils.lib.eachDefaultSystem (system:
  let
    overlays = [ (import rust-overlay) ];
    pkgs = import nixpkgs { inherit system overlays; };
  in rec
  {
    devShells.default = pkgs.mkShell {
      packages = [ packages.default pkgs.gcc13 pkgs.rust-bin.beta.latest.default pkgs.nodejs_20 pkgs.inotify-tools pkgs.cmake pkgs.zlib pkgs.openssl pkgs.prometheus-cpp ];
    };
    packages.default = pkgs.stdenv.mkDerivation {
      name = "run";
      src = pkgs.fetchurl {
        url = "https://github.com/amonks/run/releases/download/v1.0.0-beta.15/run_Linux_x86_64.tar.gz";
        sha256 = "b5f6abfc3268c0d4c2e7239ab62cd1a08975378a1e37fd61b374b346de34e8bd";
      };
      setSourceRoot = "sourceRoot=`pwd`";
      installPhase = "mkdir -p $out/bin && cp run $out/bin";
    };
  }
  );
}
