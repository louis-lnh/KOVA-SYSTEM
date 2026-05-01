# Fine Tuning and Polishing for all Websites
This File is just here to point out flaws or reask questions to make sure everything runs fine


# ADMIN
We got many pages on the admin panel but barely any contain a button to go to the page before
If you wanna move around the web you kinda need to use the browser arrows or you will get stuck

# APPLY
same thing as the admin panel. barely any back butons.
yes we do got a lot of forms already but do we perhaps forgot any forms? could there be anything that would make sense and smart to add



# MAIN



# BACKEND
Is the backend running flawless
Are there any changes we could do to improve it
Is there anything that we could add that would be helpful



# -
Across all pages the texts that we have used arent really good. some of them are still just saying what will get on the page. some of them are just "dev notes". these small things need changing
except for like pages where we already went over and worked on. but not all. and i mean like description text and hero section not like the content of the legal pages as example

Is there anything that KOVA could still need, in generall.

What needs to be done before the big deploy and launch



# RIOT DB SYSTEM 
we got many things that we can get from each player using this system but there are still many things that we need to build on our own. so we need an engine that can build the stats we need. but there is a big problem with everything entirely.
we need to somehow state in our DB in which state each registered player is in. 
examples:
1. accepted to Main or Academy Team
2. accepted for Tournament but not on any Team
3. accepted for Tournament and on any Team
4. accepted on any Team and accepted for Premier on that team
5. accepted on any team and playing in the league

there is probably more that could be added.
but in short we cant use all data
there are options that the player is placed on a team and does play in the league. then we need to save the costum match statistic of this player. but what if this guy is playing costum on his own with his friends outside of the league. if we dont do it smart we would go ahead and aswell save those. so youll probably get my point not each game of the player is useful and we need to build something that tells the DB to either save or stop saving. we need some way of letting the backend know that as example we are going ahead and queueing in the league soon so it knows he has to look for costums. 
does that make sense?




# If any Riot Accounts are needed to Test this system in the future these Accounts can be used
1. floink#shd
2. floink#shd2
3. floink#shd3
4. floink#shd4
5. floink#shd5
6.

(all of these contain data of various gamemodes across the last 30 days and older)