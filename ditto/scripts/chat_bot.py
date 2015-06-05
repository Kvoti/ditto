#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Chat admin bot to open and close the chatroom.

Run via cron.

    SleekXMPP: The Sleek XMPP Library
    Copyright (C) 2010  Nathanael C. Fritz
    This file is part of SleekXMPP.

    See the file LICENSE for copying permission.
"""

import sys
import logging
import getpass
from optparse import OptionParser
from time import sleep

import sleekxmpp

import chat.utils
from multitenancy import tenant

# Python versions before 3.0 do not use UTF-8 encoding
# by default. To ensure that Unicode is handled properly
# throughout SleekXMPP, we will set the default encoding
# ourselves to UTF-8.
if sys.version_info < (3, 0):
    from sleekxmpp.util.misc_ops import setdefaultencoding
    setdefaultencoding('utf8')
else:
    raw_input = input

# Need to query the domain here as doing it inside SendMsgBot doesnt work
DOMAIN = chat.utils.domain()


class SendMsgBot(sleekxmpp.ClientXMPP):
    def __init__(self, jid, password):
        self.me = jid
        sleekxmpp.ClientXMPP.__init__(self, jid, password)

        # The session_start event will be triggered when
        # the bot establishes its connection with the server
        # and the XML streams are ready for use. We want to
        # listen for this event so that we we can initialize
        # our roster.
        self.add_event_handler("session_start", self.start, threaded=True)
        self.add_event_handler("presence", self.presence)

    def start(self, event):
        """
        Process the session_start event.

        Typical actions for the session_start event are
        requesting the roster and broadcasting an initial
        presence stanza.

        Arguments:
            event -- An empty dictionary. The session_start
                     event does not provide any additional
                     data.
        """
        self.send_presence()
        self.get_roster()
        self.room = "main@muc.%s" % DOMAIN
        with tenant._tenant('di'):
            self.is_chatroom_open = chat.utils.is_chatroom_open()
            ### TESTING HACKS!!
            # import os
            # self.is_chatroom_open = 'OPEN' in os.environ
            ######
        # todo be more sensible to get room list here and only join
        # if room needs opened or closed
        # (it's sort of ok as outside chat hours the room will remain unconfigured so
        # it can't be used)
        self.plugin['xep_0045'].joinMUC(self.room,
                                        "chatadmin",
                                        # If a room password is needed, use:
                                        # password=the_room_password,
                                        pfrom=self.me,
                                        wait=True)
        if not self.is_chatroom_open:
            self.plugin['xep_0045'].destroy(self.room, ifrom=self.me)
        # TODO figure out how to close down properly. Not sure how to do it as it's all async
        #self.disconnect(wait=True)
        
    def presence(self, pr):
        if self.is_chatroom_open:
            # TODO only do this once (when joined room), not on each presence
            # TODO only need to configure the room if not already configured
            self.plugin['xep_0045'].configureRoom(self.room, ifrom=self.me)

        
def jid(username):
    return "%s@%s" % (username, DOMAIN)


def run():
    # Setup logging.
    logging.basicConfig(level=logging.DEBUG,
                        format='%(levelname)-8s %(message)s')

    # Setup the EchoBot and register plugins. Note that while plugins may
    # have interdependencies, the order in which you register them does
    # not matter.
    xmpp = SendMsgBot(jid("mark"), chat.utils.password("mark"))
    xmpp.register_plugin('xep_0030') # Service Discovery
    xmpp.register_plugin('xep_0199') # XMPP Ping
    xmpp.register_plugin('xep_0045')
    
    # If you are working with an OpenFire server, you may need
    # to adjust the SSL version used:
    # xmpp.ssl_version = ssl.PROTOCOL_SSLv3

    # If you want to verify the SSL certificates offered by a server:
    # xmpp.ca_certs = "path/to/ca/cert"

    # Connect to the XMPP server and start processing XMPP stanzas.
    if xmpp.connect((chat.utils.server(), 5222)):
        # If you do not have the dnspython library installed, you will need
        # to manually specify the name of the server if it does not match
        # the one in the JID. For example, to use Google Talk you would
        # need to use:
        #
        # if xmpp.connect(('talk.google.com', 5222)):
        #     ...
        xmpp.process(block=True)
        print("Done")
    else:
        print("Unable to connect.")
