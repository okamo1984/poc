use std::{
    collections::HashMap,
    fmt,
    time::{SystemTime, UNIX_EPOCH},
    u128,
};

pub(crate) struct LapTime {
    laps: HashMap<String, u128>,
    now: u128,
}

impl LapTime {
    pub fn new() -> Self {
        LapTime {
            laps: HashMap::new(),
            now: get_time(),
        }
    }

    pub fn start(&mut self) {
        self.now = get_time();
    }

    pub fn lap<S: Into<String>>(&mut self, key: S) {
        self.laps.insert(key.into(), get_time() - self.now);
        self.now = get_time();
    }
}

impl fmt::Display for LapTime {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // The `f` value implements the `Write` trait, which is what the
        // write! macro is expecting. Note that this formatting ignores the
        // various flags provided to format strings.
        let total: u128 = self.laps.values().sum();
        let mut laps = self
            .laps
            .iter()
            .map(|(key, time)| format!("Lap: {}, {} millisecond", key, time))
            .collect::<Vec<String>>();
        laps.push(format!("Total: {} millisecond", total));
        write!(f, "{}", laps.join("\n"))
    }
}

fn get_time() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
}
