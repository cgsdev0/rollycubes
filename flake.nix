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
      packages = [ packages.default pkgs.gcc13 pkgs.rust-bin.beta.latest.default pkgs.nodejs_20 pkgs.inotify-tools pkgs.cmake pkgs.zlib pkgs.openssl pkgs.prometheus-cpp pkgs.go ];
    };
    packages.default = pkgs.stdenv.mkDerivation {
      name = "run";
      src = pkgs.fetchurl {
        url = "https://github.com/amonks/run/releases/download/v1.0.0-beta.24/run_Linux_x86_64.tar.gz";
        sha256 = "bf7748242892f227a45ecc1ad6fcc65ddc9f6863f3a8cd05a5d5457ff5da3976";
      };
      setSourceRoot = "sourceRoot=`pwd`";
      installPhase = "mkdir -p $out/bin && cp run $out/bin";
    };
  }
  );
}
