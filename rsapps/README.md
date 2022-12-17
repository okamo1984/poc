# todo

Applications made by Rust

## Install cargo commands

```bash
rustup component add rustfmt
ustup component add clippy
cargo install cargo-make
```

## Format and lint

```bash
cargo make format
cargo make lint
```

## Install nerdctl

```bash
# MacOS
brew install lima
limactl start
```

## Run in docker

```bash
lima nerdctl compose up -d
cd server
cargo install sqlx-cli --no-default-features --features native-tls,postgres
DATABASE_URL='postgres://postgres:P@ssw0rd!@localhost:15432/todo' sqlx migrate run
```

## Save database information

```bash
DATABASE_URL='postgres://postgres:P@ssw0rd!@localhost:15432/todo' cargo sqlx prepare -- --bin todo-server
```


Then, access `localhost:8080`.
