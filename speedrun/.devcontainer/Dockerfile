FROM python:3.9.2-slim

# Basic
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y curl wget unzip zsh software-properties-common gnupg2 build-essential vim \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Packer and Terraform
RUN wget https://github.com/hashicorp/packer/releases/download/nightly/packer_linux_arm64.zip
RUN unzip packer_linux_arm64.zip
RUN mv packer /usr/local/bin/

RUN wget https://releases.hashicorp.com/terraform/0.14.7/terraform_0.14.7_linux_arm64.zip
RUN unzip terraform_0.14.7_linux_arm64.zip
RUN mv terraform /usr/local/bin/

# GitHub CLI
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-key C99B11DEB97541F0 \
    && apt-add-repository https://cli.github.com/packages \
    && apt update \
    && apt install -y gh \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

USER vscode

# Oh My Zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN git clone https://github.com/zsh-users/zsh-autosuggestions.git $HOME/.oh-my-zsh/custom/plugins/zsh-autosuggestions
RUN git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
RUN sed -i 's/plugins=(git)/plugins=(git zsh-syntax-highlighting zsh-autosuggestions)/g' ~/.zshrc

# Poetry
RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/get-poetry.py | python -
RUN mkdir -p $HOME/.oh-my-zsh/custom/plugins/poetry
RUN $HOME/.poetry/bin/poetry completions zsh > $HOME/.oh-my-zsh/custom/plugins/poetry/_poetry
RUN terraform -install-autocomplete
RUN echo 'export PATH=$HOME/.local/bin:$HOME/.poetry/bin:$PATH"' >> $HOME/.zshrc

COPY gitconfig /home/vscode/.gitconfig
COPY git.sh /home/vscode/

RUN pip3 install --user azure-cli

CMD ["/bin/zsh"]
