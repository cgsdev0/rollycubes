module random_m

      use iso_c_binding
      use mod_dill

      implicit none

      character, parameter :: nullc = c_null_char

contains

!===============================================================================

function len_sz(str_)
      character(len = *), intent(in) :: str_
      integer(c_size_t) :: len_sz
      len_sz = len(str_)
end function len_sz

!===============================================================================

end module random_m

!===============================================================================

program random_server

    use random_m
    implicit none

    integer(c_int) :: connection, rc, socket
    type(ipaddr) :: addr, addr_remote
    character(kind=c_char, len=IPADDR_MAXSTRLEN) :: address_string = ""
    character(len=*), parameter :: TCP_SUFFIX = c_carriage_return//c_new_line

    integer(c_int64_t) :: NO_DEADLINE = -1

    character :: buffer*32
    character(len = :), allocatable :: str_
    double precision :: dnum
    integer :: num

    ! 127.0.0.1 is not accessible outside of docker, but 0.0.0.0 is
    rc = ipaddr_local(addr, "0.0.0.0"//nullc, 5555_c_int, IPADDR_IPV4)

    call ipaddr_str(addr, address_string)

    write(*,*) "Listening on socket:"
    write(*,*) "  IP address: ", address_string
    write(*,*) "  Port: ", ipaddr_port(addr)

    socket = tcp_listen(addr, 0_c_int)

    do
        connection = tcp_accept(socket, addr_remote, NO_DEADLINE)
        call ipaddr_str(addr, address_string)
        write(*,*) "New connection from "//trim(address_string)

        ! Subtract 1 from len to not count the null terminator
        connection = suffix_attach(connection, TCP_SUFFIX//nullc, &
            len_sz(TCP_SUFFIX))

        ! TODO roll our own rng just for lulz
        call random_number(dnum)

        ! TODO: range [1, 6]
        num = int(dnum * huge(num))

        ! TODO: send binary char(s).  Can pack two [1,6] rolls into a single byte
        write(buffer, "(i0)") num
        print *, "num = ", num
        str_ = trim(buffer)
        rc = msend(connection, str_//nullc, len_sz(str_), NO_DEADLINE)

        connection = suffix_detach(connection, NO_DEADLINE)
        rc = tcp_close(connection, NO_DEADLINE)
    end do

end program random_server
