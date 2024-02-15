program server

  use iso_c_binding, only: c_char, c_int, c_int64_t, c_null_char, c_size_t, &
                           c_carriage_return, c_new_line
  use mod_dill, only: ipaddr, ipaddr_local, ipaddr_port, ipaddr_str, &
                      IPADDR_MAXSTRLEN, IPADDR_IPV4, tcp_accept, tcp_close, &
                      tcp_listen, msend, suffix_attach, suffix_detach

  implicit none

  integer(c_int) :: connection, rc, socket
  type(ipaddr) :: addr, addr_remote
  character(kind=c_char, len=IPADDR_MAXSTRLEN) :: address_string = ''
  character(len=*), parameter :: TCP_SUFFIX = c_carriage_return // c_new_line // c_null_char

  integer(c_int64_t) :: NO_DEADLINE = -1

  character :: buffer*32
  character(len = :), allocatable :: str_
  double precision :: dnum
  integer :: num
  integer(c_size_t) :: len_

  !rc = ipaddr_local(addr, '127.0.0.1' // c_null_char, 5555_c_int, IPADDR_IPV4)

  ! 127.0.0.1 is not accessible outside of docker, but 0.0.0.0 is
  rc = ipaddr_local(addr, '0.0.0.0' // c_null_char, 5555_c_int, IPADDR_IPV4)

  call ipaddr_str(addr, address_string)

  print *, 'Listening on socket:'
  print *, '  IP address: ', address_string
  print *, '  Port: ', ipaddr_port(addr)

  socket = tcp_listen(addr, 0_c_int) 

  do
    connection = tcp_accept(socket, addr_remote, NO_DEADLINE)
    call ipaddr_str(addr, address_string)
    print *, 'New connection from ' // trim(address_string)

    ! Subtract 1 from len to not count the null terminator
    len_ = len(TCP_SUFFIX) - 1
    connection = suffix_attach(connection, TCP_SUFFIX, 2_c_size_t)

    call random_number(dnum)
    num = int(dnum * huge(num))
    write(buffer, "(i0)") num
    print *, 'num = ', num
    str_ = trim(buffer)
    len_ = len(str_)
    rc = msend(connection, str_ // c_null_char, len_, -1_c_int64_t)

    connection = suffix_detach(connection, -1_c_int64_t)
    rc = tcp_close(connection, -1_c_int64_t)
  end do

end program server
