from django.shortcuts import get_object_or_404
from rest_framework import generics, response
from rest_framework.decorators import api_view

from .. import models
from . import serializers


class TicketList(generics.ListAPIView):
    serializer_class = serializers.ViewTicketSerializer
    queryset = models.Ticket.objects.all()
    #TODO permission_classes


@api_view(['POST'])
def claim(request, pk):
    ticket = get_object_or_404(models.Ticket.objects.unclaimed(),
                               pk=pk)
    ticket.claim(request.user)
    # TODO what message to return here?
    return response.Response('Ticket claimed')


@api_view(['POST'])
def resolve(request, pk):
    ticket = get_object_or_404(models.Ticket.objects.unresolved(),
                               pk=pk)
    ticket.resolve()
    # TODO what message to return here?
    return response.Response('Ticket resolved')
