#[macro_use]
extern crate log;

pub mod config;
pub mod inference;
mod lap;
mod preprocessor;

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
