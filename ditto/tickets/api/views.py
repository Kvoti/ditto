from django.shortcuts import get_object_or_404
from rest_framework import generics, response
from rest_framework.decorators import api_view

from .. import models
from . import serializers


class TicketList(generics.ListAPIView):
    serializer_class = serializers.ViewTicketSerializer
    #TODO permission_classes

    def get_queryset(self):
        return models.Ticket.objects.manageable(self.request.user)
        

@api_view(['POST'])
def claim(request, pk):
    ticket = get_object_or_404(
        models.Ticket.objects.claimable(request.user),
        pk=pk)
    ticket.claim(request.user)
    # TODO what message to return here?
    return response.Response('Ticket claimed')


@api_view(['POST'])
def resolve(request, pk):
    ticket = get_object_or_404(
        request.user.assigned_tickets.unresolved(),
        pk=pk
    )
    ticket.resolve(request.user)
    # TODO what message to return here?
    return response.Response('Ticket resolved')
