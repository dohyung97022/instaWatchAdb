## base image
# FROM ubuntu:latest
# WORKDIR /app

# RUN apt-get -y update
# RUN apt-get -y install sudo

# RUN sudo apt-get -y install nodejs
# RUN sudo apt-get -y install npm
# COPY package.json package.json
# RUN npm install

# #error while loading shared libraries: libnss3.so
# #https://community.gitpod.io/t/using-puppeteer-libnss3-no-file-or-directory-issue-on-gitpod/1762/6
# RUN sudo apt-get -y install libnss3 

# #error while loading shared libraries: libatk-1.0.so.0, ibXss.so.1
# #https://gist.github.com/winuxue/cfef08e2f5fe9dfc16a1d67a4ad38a01
# RUN sudo apt-get -y install libgtk-3-0
# RUN sudo apt-get -y install libxss1
# RUN sudo apt-get -y install libasound2

# #error while loading shared libraries:  libgbm.so.1
# #https://github.com/actions/virtual-environments/issues/732
# RUN sudo apt-get -y install libgbm-dev

# COPY cookies cookies
# COPY testing.js testing.js
# CMD ["node", "testing.js","--id","'01046726981'"]


# -------------------------------------------------------------------------------------------------------------


# # this is the lambda linux version
# FROM public.ecr.aws/lambda/provided:al2

# # RUN yum -y update
# # RUN yum -y install sudo

# WORKDIR /var/runtime/
# COPY bootstrap bootstrap
# RUN chmod 755 bootstrap

# RUN curl --silent --location https://rpm.nodesource.com/setup_lts.x | bash -
# RUN yum -y install nodejs

# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/atk/20170804103727/2.22.0-3.el7.x86_64/atk-debuginfo-2.22.0-3.el7.x86_64.rpm
# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/at-spi2-atk/20170807002343/2.22.0-2.el7.x86_64/at-spi2-atk-2.22.0-2.el7.x86_64.rpm
# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/at-spi2-core/20170802043614/2.22.0-1.el7.x86_64/at-spi2-core-2.22.0-1.el7.x86_64.rpm
# RUN yum install -y nodejs gcc-c++ make cups-libs dbus-glib libXrandr libXcursor libXinerama cairo cairo-gobject pango libXScrnSaver gtk3
# # RUN yum remove alsa-lib-1.1.4.1-2.amzn2.i686
# # RUN yum install alsa-lib-1.1.3-3.amzn2.x86_64

# WORKDIR /var/task/
# COPY package.json package.json
# COPY app.js app.js
# COPY app.sh app.sh
# RUN chmod 755 app.sh
# RUN npm install

# CMD ["app.sh.handler"]


# tried 1.
# https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# RUN . ~/.nvm/nvm.sh
# RUN nvm install node

# tried 2.
# RUN sudo amazon-linux-extras install epel
# RUN sudo yum install nodejs

# tried 3.
# RUN rpm -ivh --nodeps https://rpmfind.net/linux/opensuse/ports/armv6hl/tumbleweed/repo/oss/armv6hl/libasound2-1.2.4-2.1.armv6hl.rpm



# -------------------------------------------------------------------------------------------------------------

# RUN  yum update \
#     && yum install -y wget gnupg ca-certificates \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && yum update \
#     # We install Chrome to get all the OS level dependencies, but Chrome itself
#     # is not actually used as it's packaged in the node puppeteer library.
#     # Alternatively, we could could include the entire dep list ourselves
#     # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
#     # but that seems too easy to get out of date.
#     && yum install -y google-chrome-stable \
#     && rm -rf /var/lib/apt/lists/* \
#     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
#     && chmod +x /usr/sbin/wait-for-it.sh

# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/atk/20170804103727/2.22.0-3.el7.x86_64/atk-debuginfo-2.22.0-3.el7.x86_64.rpm
# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/at-spi2-atk/20170807002343/2.22.0-2.el7.x86_64/at-spi2-atk-2.22.0-2.el7.x86_64.rpm
# RUN rpm -ivh --nodeps https://buildlogs.centos.org/c7.1708.00/at-spi2-core/20170802043614/2.22.0-1.el7.x86_64/at-spi2-core-2.22.0-1.el7.x86_64.rpm


#https://centos.pkgs.org/

# libasound2
# RUN rpm -ivh --nodeps http://vault.centos.org/7.7.1908/os/Source/SPackages/alsa-lib-1.1.8-1.el7.src.rpm

# libatk-1.0.so.0
#http://vault.centos.org/8.1.1911/AppStream/Source/SPackages/atk-2.28.1-1.el8.src.rpm
#http://vault.centos.org/7.7.1908/os/Source/SPackages/atk-2.28.1-2.el7.src.rpm
#http://mirror.centos.org/centos/7/os/x86_64/Packages/atk-2.28.1-2.el7.x86_64.rpm
# RUN rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/atk-2.28.1-2.el7.x86_64.rpm

#libatk-bridge-2.0.so.0
#http://vault.centos.org/7.7.1908/os/Source/SPackages/at-spi2-atk-2.26.2-1.el7.src.rpm
# RUN rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/at-spi2-atk-2.26.2-1.el7.x86_64.rpm

#libX11.so.6
#http://vault.centos.org/7.7.1908/os/Source/SPackages/libX11-1.6.7-2.el7.src.rpm
# RUN rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/libX11-1.6.7-2.el7.x86_64.rpm

#libxcb.so.1
#http://vault.centos.org/7.7.1908/os/Source/SPackages/libxcb-1.13-1.el7.src.rpm
#http://vault.centos.org/8.1.1911/AppStream/Source/SPackages/libxcb-1.13.1-1.el8.src.rpm
#http://mirror.centos.org/centos/8/AppStream/x86_64/os/Packages/libxcb-1.13.1-1.el8.i686.rpm
# RUN rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/libxcb-1.13-1.el7.i686.rpm
# RUN yum install -y libxcb

#libcups.so.2
# RUN yum install -y libcups
#http://vault.centos.org/7.7.1908/os/Source/SPackages/libxcb-1.13-1.el7.src.rpm
# RUN rpm -ivh --nodeps http://mirror.centos.org/centos/7/os/x86_64/Packages/libxcb-1.13-1.el7.x86_64.rpm

#https://intoli.com/blog/installing-google-chrome-on-centos/

# the arch is not
# aarch64
# armv7hl

FROM amazon/aws-lambda-nodejs:12
RUN curl https://intoli.com/install-google-chrome.sh | bash
COPY *.js package*.json ./
RUN npm install
CMD ["main.lambdaHandler"]


