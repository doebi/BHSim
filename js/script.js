$(function(){
    var game;
    var cooldowns = [];
    var levels = [
        {
            "label": "Rekr",
            "xp": 10,
        },
        {
            "label": "Gfr",
            "xp": 20,
        },
        {
            "label": "Kpl",
            "xp": 30,
        },
        {
            "label": "Zgf",
            "xp": 400000000,
        }
    ];
    var progressTemplate = Handlebars.compile($("#progress-template").html());

    var Cooldown = function(container){
        this.container = container;
        this.start = null;
        this.cooldown = Number(container.data("cooldown"))*1000;
        this.reward = Number(container.data("reward"));
    };

    Cooldown.prototype.update = function(timestamp){
        if(this.start == null){
            this.start = timestamp;
        }
        var progress = timestamp-this.start;
        if (progress > this.cooldown) {
            this.container.html("<button class=\"btn btn-success btn-block\">Durchführen</button>");
            this.container.find("button").on("click", function(){
                var cd = new Cooldown($(this).parent());
                cooldowns.push(cd);
            });
            cooldowns.splice(cooldowns.indexOf(this), 1);
            game.xp += this.reward;
        } else {
            var context = {};
            context.width = progress / (this.cooldown/100);
            context.displayValue = parseInt(context.width);
            var value = parseInt((this.cooldown - progress)/1000);
            context.timeleft = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
            context.timeleft.seconds = parseInt(value % 60);
            value = value / 60;
            context.timeleft.minutes = parseInt(value % 60);
            value = value / 60;
            context.timeleft.hours = parseInt(value % 24);
            value = value / 24;
            context.timeleft.days = parseInt(value);
            this.container.html(progressTemplate(context));
        }
    };

    var Game = function() {
        this.xp = 0;
        this.money = 0;
        this.level = levels[0];
        this.xpElement = $("#xp");
        this.moneyElement = $("#money");
        this.levelElement = $("#level");
        this.init();
        this.payout = null;
    };

    Game.prototype.init = function(){
        /* weird shit in here */
        $(".action-trigger button").on("click", function(){
            var cd = new Cooldown($(this).parent());
            cooldowns.push(cd);
        });
    };

    Game.prototype.update = function(timestamp){
        if(this.payout == null || timestamp > this.payout + 1000){
            this.money += this.xp;
            this.payout = timestamp;
        }
        if(this.xp >= this.level.xp){
            this.level = levels[levels.indexOf(this.level)+1];
        }
        this.xpElement.html(this.xp);
        this.moneyElement.html(this.money);
        this.levelElement.html(this.level.label);
        cooldowns.forEach(function(obj){
            obj.update(timestamp);
        });
    };

    function step(timestamp) {
        game.update(timestamp);
        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
    game = new Game();
});
