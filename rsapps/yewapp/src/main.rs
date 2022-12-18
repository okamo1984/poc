#![recursion_limit = "512"]
extern crate yew;
#[macro_use]
extern crate strum;

use yew::prelude::*;

mod login;
mod todo;
mod utils;
use login::LoginApp;
use todo::TodoApp;
use utils::{get_jwt, set_jwt};

pub enum AppMessage {
    Authenticated(String),
}

pub struct App {
    is_login: bool,
    link: ComponentLink<Self>,
}

impl Component for App {
    type Message = AppMessage;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        let mut is_login = false;
        if get_jwt().is_some() {
            is_login = true;
        }
        Self { is_login, link }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        match msg {
            AppMessage::Authenticated(jwt) => {
                set_jwt(jwt);
                self.is_login = true;
            }
        }
        true
    }

    fn change(&mut self, _props: Self::Properties) -> bool {
        unimplemented!()
    }

    fn view(&self) -> Html {
        html! {
            if self.is_login {
                html! {<TodoApp />}
            } else {
                html! {<LoginApp app_link=self.link.clone() />}
            }
        }
    }
}

pub fn main() {
    yew::start_app::<App>();
}
