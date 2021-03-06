# config valid only for Capistrano 3.1
lock '3.2.1'

set :application, 'web_client'
set :repo_url, 'git@github.com:tosslab/web_client.git'

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }.call

# Default deploy_to directory is /var/www/my_app
set :deploy_to, '/srv/www/web_client'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
set :log_level, :info

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# set :linked_dirs, %w{node_modules}
set :linked_dirs, %w{node_modules client/bower_components}
# set :linked_files, %w{config/database.yml}

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }
set :default_env, {
  'NODE_ENV' => 'production'
}

# Default value for keep_releases is 5
set :keep_releases, 10

namespace :deploy do

  before :updated, :npm_install do
    on roles(:all) do
      within release_path do
        execute :npm, 'install', '--quiet'
      end
    end
    on roles(:client) do
      within release_path do
        execute :bower, 'prune', '--quiet'
        execute :bower, 'install', '--quiet'

        if fetch(:stage).to_s.start_with? 'dev'
          execute :grunt, 'development'
          execute :grunt, 'build'
        else
          execute :grunt, 'deploy'
        end
      end
    end
    on roles(:server) do
      within release_path do
        execute :bower, 'prune', '--quiet'
        execute :bower, 'install', '--quiet'
        execute :grunt, 'build'
        execute :ln, '-s', '/srv/www/web_client/current/dist/public', './public/app'
        execute :ln, '-s', '/srv/www/web_landing/current/dist/public', './public/landing'
        execute :ln, '-s', '/srv/www/web_admin/current/dist/public', './public/main'
      end
    end
  end

  after :publishing, :restart do
    on roles(:server), in: :parallel do
      within current_path do
        execute :pm2, 'startOrRestart', 'config/pm2/default.json'
      end
    end
  end

end
